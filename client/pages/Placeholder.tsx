import { ReactNode } from "react";

export default function Placeholder({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <section className="container min-h-[50vh] py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-brand text-4xl text-foreground">{title}</h1>
        <p className="mt-4 text-foreground/70">
          This page is ready to be filled. Tell Fusion what you want here and it
          will build it.
        </p>
        {children}
      </div>
    </section>
  );
}
