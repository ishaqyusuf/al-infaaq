import { Card } from "@al-infaaq/ui/card";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] dark:bg-[#11100d] px-5 py-8 text-stone-950 dark:text-stone-50 sm:px-8">
      <section className="mx-auto grid max-w-5xl gap-5">
        <Card className="p-5">
          <div className="h-4 w-28 rounded-md bg-stone-200 dark:bg-stone-800" />
          <div className="mt-4 h-8 w-full max-w-md rounded-md bg-stone-200 dark:bg-stone-800" />
          <div className="mt-3 h-4 w-full max-w-2xl rounded-md bg-stone-100 dark:bg-stone-900" />
          <div className="mt-2 h-4 w-full max-w-xl rounded-md bg-stone-100 dark:bg-stone-900" />
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <div className="h-5 w-40 rounded-md bg-stone-200 dark:bg-stone-800" />
            <div className="mt-4 h-2 rounded-full bg-stone-100 dark:bg-stone-900" />
            <div className="mt-4 h-4 w-32 rounded-md bg-stone-100 dark:bg-stone-900" />
          </Card>
          <Card className="p-5">
            <div className="h-5 w-36 rounded-md bg-stone-200 dark:bg-stone-800" />
            <div className="mt-4 h-2 rounded-full bg-stone-100 dark:bg-stone-900" />
            <div className="mt-4 h-4 w-28 rounded-md bg-stone-100 dark:bg-stone-900" />
          </Card>
        </div>
      </section>
    </main>
  );
}
