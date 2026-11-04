// import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedStudios from "@/components/FeaturedStudios";
import StudioCategories from "@/components/StudioCategories";
import HowItWorks from "@/components/HowItWorks";
import AboutUs from "@/components/AboutUs";
// import { getApiHealth } from "@/lib/api";

export default async function Home() {
  // let apiConnected = false;
  // let apiMessage = "Unable to connect to Frame API";

  try {
    // const health = await getApiHealth();
    // apiConnected = health.success;
    // apiMessage = health.message;
  } catch (error) {
    console.error("Frame API health check failed:", error);
  }

  return (
    <>
      {/* <Navbar /> */}
      <Hero />
      <StudioCategories />
      <FeaturedStudios />
      <HowItWorks />
      <AboutUs />
      {/* <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-black">
        <h1 className="text-5xl font-semibold tracking-tight">
          Frame
        </h1>

        <p className="mt-4 text-lg text-neutral-600">
          Space to create without limits.
        </p>

        <div className="mt-10 rounded-xl border border-neutral-200 px-6 py-5">
          <p className="text-sm font-medium text-neutral-500">
            Backend Connection
          </p>

          <p
            className={`mt-2 text-lg font-semibold ${apiConnected ? "text-green-700" : "text-red-600"
              }`}
          >
            {apiConnected ? "Connected" : "Disconnected"}
          </p>

          <p className="mt-2 text-sm text-neutral-600">
            {apiMessage}
          </p>
        </div>
      </main> */}
    </>
  );
}
