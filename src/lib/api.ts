
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  export async function getApiHealth() {
    if (!API_URL) {
      throw new Error("NEXT_PUBLIC_API_URL is not configured.");
    }

    const response = await fetch(`${API_URL}/api/health`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json() as Promise<{
      success: boolean;
      message: string;
    }>;
  }
  