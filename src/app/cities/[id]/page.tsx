import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCityById } from "@/lib/data-access/cities";
import { CityDetailPage } from "@/components/city-detail-page";

interface CityPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const city = await getCityById(id);

    return {
      title: `${city.name}, ${city.country} - Digital Nomad Guide | FreeNomad`,
      description:
        city.shortDescription ||
        city.description ||
        `Discover ${city.name}, ${city.country} as a digital nomad destination. Find cost of living, internet speed, safety ratings, and reviews from fellow nomads.`,
      keywords: [
        city.name,
        city.country,
        "digital nomad",
        "remote work",
        "cost of living",
        "internet speed",
        "nomad destination",
        "travel",
        "work remotely",
      ],
      openGraph: {
        title: `${city.name}, ${city.country} - Digital Nomad Guide`,
        description:
          city.shortDescription ||
          `Explore ${city.name} as your next nomad destination`,
        images: city.imageUrl
          ? [
              {
                url: city.imageUrl,
                width: 1200,
                height: 630,
                alt: `${city.name}, ${city.country}`,
              },
            ]
          : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${city.name}, ${city.country} - Digital Nomad Guide`,
        description:
          city.shortDescription ||
          `Explore ${city.name} as your next nomad destination`,
        images: city.imageUrl ? [city.imageUrl] : [],
      },
      alternates: {
        canonical: `/cities/${id}`,
      },
    };
  } catch {
    return {
      title: "City Not Found | FreeNomad",
      description: "The requested city could not be found.",
    };
  }
}

// Main page component with server-side rendering
export default async function CityPage({ params }: CityPageProps) {
  try {
    const { id } = await params;
    const city = await getCityById(id);

    if (!city) {
      notFound();
    }

    return (
      <CityDetailPage
        city={city as unknown as Parameters<typeof CityDetailPage>[0]["city"]}
      />
    );
  } catch (error) {
    console.error("Error fetching city:", error);
    notFound();
  }
}

// Generate static params for popular cities (optional optimization)
export async function generateStaticParams() {
  // This could be enhanced to pre-generate pages for featured cities
  return [];
}
