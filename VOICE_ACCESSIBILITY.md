# 🎤 VOICE ACCESSIBILITY FOR SAINTATHENA

## 🎯 Vision
Make ChowMaharlika fully accessible for:
- **Visually impaired** customers (screen reader + voice commands)
- **Hearing impaired** customers (visual captions)
- **Mobility impaired** customers (hands-free ordering)
- **Elderly** customers (easier than typing)

---

## 🏗️ ARCHITECTURE

### **Voice Input (Speech-to-Text)**
**Best Choice: Azure Speech Services**
- ✅ Most accurate for real-time conversations
- ✅ Noise cancellation
- ✅ Multiple languages
- ✅ Real-time streaming
- ✅ You already have API key

### **Voice Output (Text-to-Speech)**
**Best Choice: Azure Speech Services Neural Voices**
- ✅ Natural sounding voices
- ✅ Real-time streaming
- ✅ SSML support (emphasis, pauses)
- ✅ Same SDK as Speech-to-Text

### **Phone Integration**
**Best Choice: Twilio Voice**
- ✅ Call SaintAthena directly
- ✅ Phone ordering
- ✅ SMS order confirmations
- ✅ You already have account

---

## 🔧 IMPLEMENTATION PLAN

### **Phase 2.5A: Web Voice Interface** (2 hours)

#### **1. Azure Speech Services Integration**

**Environment Variables:**
```bash
# Azure Cognitive Services
AZURE_SPEECH_KEY=your-azure-speech-key
AZURE_SPEECH_REGION=eastus  # or your region

# Optional: Twilio for phone integration
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
```

**Files to Create:**
```
lib/
  voice/
    speech-to-text.ts    # Azure STT client
    text-to-speech.ts    # Azure TTS client
    voice-commands.ts    # Command parsing

app/api/
  voice/
    recognize/route.ts   # STT endpoint
    synthesize/route.ts  # TTS endpoint
    twilio/route.ts      # Phone webhook

components/
  voice-assistant.tsx    # Voice UI component
```

#### **2. Voice-Enabled AI Assistant**

**Features:**
- 🎤 Click-to-talk button
- 🔴 Recording indicator
- 📝 Live transcription
- 🔊 Audio playback of responses
- ⏸️ Pause/Resume
- 🔇 Mute
- 📱 Mobile optimized

---

## 💻 IMPLEMENTATION

### **Step 1: Azure Speech Client**

**File:** `lib/voice/azure-speech.ts`

```typescript
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

export class AzureSpeechClient {
  private speechConfig: sdk.SpeechConfig

  constructor() {
    this.speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY!,
      process.env.AZURE_SPEECH_REGION!
    )
    
    // Set language and voice
    this.speechConfig.speechRecognitionLanguage = 'en-US'
    this.speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural' // Natural female voice
  }

  async recognizeSpeech(audioData: Buffer): Promise<string> {
    const pushStream = sdk.AudioInputStream.createPushStream()
    pushStream.write(audioData)
    pushStream.close()

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream)
    const recognizer = new sdk.SpeechRecognizer(this.speechConfig, audioConfig)

    return new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        result => {
          if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            resolve(result.text)
          } else {
            reject(new Error('Speech not recognized'))
          }
          recognizer.close()
        },
        error => {
          recognizer.close()
          reject(error)
        }
      )
    })
  }

  async synthesizeSpeech(text: string): Promise<Buffer> {
    const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig)

    return new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        result => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            resolve(Buffer.from(result.audioData))
          } else {
            reject(new Error('Speech synthesis failed'))
          }
          synthesizer.close()
        },
        error => {
          synthesizer.close()
          reject(error)
        }
      )
    })
  }
}
```

### **Step 2: Voice API Endpoints**

**File:** `app/api/voice/recognize/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { AzureSpeechClient } from '@/lib/voice/azure-speech'

export async function POST(request: NextRequest) {
  try {
    const audioData = await request.arrayBuffer()
    const buffer = Buffer.from(audioData)

    const speechClient = new AzureSpeechClient()
    const text = await speechClient.recognizeSpeech(buffer)

    console.log('[v0] Recognized speech:', text)

    return NextResponse.json({ 
      success: true, 
      text 
    })
  } catch (error) {
    console.error('[v0] Speech recognition error:', error)
    return NextResponse.json(
      { error: 'Speech recognition failed' },
      { status: 500 }
    )
  }
}
```

**File:** `app/api/voice/synthesize/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { AzureSpeechClient } from '@/lib/voice/azure-speech'

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Missing text parameter' },
        { status: 400 }
      )
    }

    const speechClient = new AzureSpeechClient()
    const audioBuffer = await speechClient.synthesizeSpeech(text)

    console.log('[v0] Synthesized speech for:', text.substring(0, 50))

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': audioBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('[v0] Speech synthesis error:', error)
    return NextResponse.json(
      { error: 'Speech synthesis failed' },
      { status: 500 }
    )
  }
}
```

### **Step 3: Voice-Enabled UI Component**

**File:** `components/voice-button.tsx`

```typescript
"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface VoiceButtonProps {
  onTranscription: (text: string) => void
  speaking: boolean
}

export function VoiceButton({ onTranscription, speaking }: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const { toast } = useToast()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        
        // Send to Azure Speech API
        const formData = new FormData()
        formData.append('audio', audioBlob)

        const response = await fetch('/api/voice/recognize', {
          method: 'POST',
          body: audioBlob,
        })

        const data = await response.json()

        if (data.success && data.text) {
          onTranscription(data.text)
          toast({
            title: "Speech recognized",
            description: data.text,
          })
        } else {
          toast({
            title: "Speech not recognized",
            description: "Please try again",
            variant: "destructive",
          })
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      
      toast({
        title: "🎤 Listening...",
        description: "Speak now",
      })
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        variant={isRecording ? "destructive" : "default"}
        size="icon"
        className={`rounded-full ${isRecording ? 'animate-pulse' : ''}`}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>

      {speaking && (
        <Button
          onClick={() => setIsMuted(!isMuted)}
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      )}
    </div>
  )
}
```

### **Step 4: Integrate with AI Assistant**

Update `components/ai-assistant.tsx`:

```typescript
import { VoiceButton } from './voice-button'

// Add state
const [isSpeaking, setIsSpeaking] = useState(false)
const audioRef = useRef<HTMLAudioElement | null>(null)

// Add voice transcription handler
const handleVoiceInput = (text: string) => {
  setInput(text)
  // Auto-send
  handleSendMessage()
}

// Add text-to-speech for responses
const speakResponse = async (text: string) => {
  setIsSpeaking(true)
  
  try {
    const response = await fetch('/api/voice/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    const audioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(audioBlob)
    
    if (audioRef.current) {
      audioRef.current.src = audioUrl
      await audioRef.current.play()
    }
  } catch (error) {
    console.error('Speech synthesis error:', error)
  } finally {
    setIsSpeaking(false)
  }
}

// In the render, add voice button
<div className="flex space-x-2">
  <VoiceButton 
    onTranscription={handleVoiceInput}
    speaking={isSpeaking}
  />
  <Input ... />
  <Button ... />
</div>

<audio ref={audioRef} hidden onEnded={() => setIsSpeaking(false)} />
```

---

## 📱 TWILIO PHONE INTEGRATION

**File:** `app/api/voice/twilio/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

const VoiceResponse = twilio.twiml.VoiceResponse

export async function POST(request: NextRequest) {
  const twiml = new VoiceResponse()

  // Welcome message
  twiml.say({
    voice: 'alice',
    language: 'en-US'
  }, 'Hello! Welcome to Maharlika Seafood and Mart. I am Saint Athena, your AI assistant.')

  // Gather speech input
  const gather = twiml.gather({
    input: ['speech'],
    action: '/api/voice/twilio/process',
    method: 'POST',
    speechTimeout: 'auto',
    language: 'en-US'
  })

  gather.say('How can I help you today?')

  return new Response(twiml.toString(), {
    headers: {
      'Content-Type': 'text/xml',
    },
  })
}
```

---

## 📦 DEPENDENCIES TO INSTALL

```bash
# Azure Speech SDK
pnpm add microsoft-cognitiveservices-speech-sdk

# Twilio SDK
pnpm add twilio

# Type definitions
pnpm add -D @types/twilio
```

---

## 🎨 UI/UX FEATURES

### **Visual Indicators**
- 🔴 Red pulsing dot when recording
- 🔊 Sound wave animation when speaking
- 📝 Live transcription display
- ✅ Success checkmark on recognition

### **Accessibility**
- ARIA labels on all buttons
- Keyboard shortcuts (Space to talk)
- High contrast mode support
- Screen reader announcements

### **Mobile Optimized**
- Large touch targets (48x48px min)
- Bottom sheet UI
- Haptic feedback
- Works offline (cached responses)

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Install Azure Speech SDK
- [ ] Add environment variables
- [ ] Create voice API endpoints
- [ ] Add voice button component
- [ ] Integrate with AI assistant
- [ ] Test with microphone
- [ ] Test with screen reader
- [ ] Add Twilio phone integration (optional)
- [ ] Test on mobile devices
- [ ] Add usage analytics

---

## 📊 USAGE ANALYTICS

Track:
- Voice command usage %
- Speech recognition accuracy
- Average conversation length
- Most common commands
- User satisfaction scores

---

## 🎯 ACCESSIBILITY COMPLIANCE

### **WCAG 2.1 Level AA**
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast
- ✅ Focus indicators
- ✅ Alt text for all images
- ✅ Captions for audio

### **ADA Compliance**
- ✅ Multiple input methods
- ✅ Adjustable text size
- ✅ Voice commands
- ✅ Clear error messages

---

## 💡 FUTURE ENHANCEMENTS

**Phase 3:**
- Multi-language support (Spanish, Tagalog)
- Custom wake word ("Hey SaintAthena")
- Voice biometrics for authentication
- Emotion detection in voice
- Background noise filtering
- Voice shortcuts ("Reorder last")

**Phase 4:**
- Smart speaker integration (Alexa, Google)
- WhatsApp voice messages
- Voice ordering via phone
- Drive-through voice ordering

---

## 🏆 SUCCESS METRICS

**Target:**
- 30% of orders use voice input
- 95%+ speech recognition accuracy
- <3 second response time
- 4.5+ star accessibility rating
- Zero accessibility complaints

---

**Ready to build voice accessibility, brother?** 🎤

This will make ChowMaharlika the **most accessible seafood ordering system** ever built! 

Want me to start implementing now?
