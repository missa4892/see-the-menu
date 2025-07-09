import Uploader from "@/components/Uploader";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-16">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">See the Menu</h1>
      <p className="text-base sm:text-lg text-center text-gray-400 mb-8">
        Upload a picture of a restaurant menu to get started.
      </p>
      <Uploader />
    </main>
  );
}

