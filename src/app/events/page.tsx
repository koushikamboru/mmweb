import { CardContainer, CardItem } from "@/components/ui/3d-card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Monoton } from "next/font/google";
import Hackathon from "@/components/Hackathon";

const monoton = Monoton({ weight: ["400"], subsets: ["latin"] });

export default function Events() {
    const eventsList = [
        {
            title: "Kalakshetra",
            video: "https://res.cloudinary.com/dbjy9s3cz/video/upload/v1726133759/meyg1boduaquqrhgb7o2.mp4",
            link: "/events/kalakshetra",
        },
        {
            title: "Workshops & Tech",
            video: "https://res.cloudinary.com/dbjy9s3cz/video/upload/v1726655934/WORKSHOPS_tech_2_fezndb.mp4",
            link: "/events/workshops",
        },
        {
            title: "SpotEvents",
            video: "https://res.cloudinary.com/dbjy9s3cz/video/upload/v1726133759/srzs3kfwhzpurixnkbfo.mp4",
            link: "/events/spotevents",
        },
    ];

    return (
        <>
            <div className="py-8 px-4 sm:py-16 md:py-28 space-y-6 min-h-screen bg-no-repeat bg-cover bg-[url('https://res.cloudinary.com/dbjy9s3cz/image/upload/v1726137106/eventsBG_sqtyf1.svg')]">
                <section className="grid grid-cols-1 lg:grid-cols-3 items-center justify-center w-full gap-4 md:gap-12 px-4 md:px-24 lg:px-[10rem]">
                    {eventsList.map((event, index) => {
                        return (
                            <Link href={event.link} key={index}>
                                <CardContainer
                                    key={index}
                                    className={cn(
                                        "w-full bg-gradient-to-br from-[rgba(255,255,255,20)] to-[rgba(255,255,255,0)] rounded-[20px]",
                                        "card-container-events"
                                    )}
                                >
                                    <div className="w-full p-6 backdrop-blur-[150px] rounded-[20px]">
                                        <CardItem className="aspect-[3000/4500] w-full rounded-lg">
                                            <video
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                typeof="video/mp4"
                                                className="w-full h-full object-cover rounded-lg object-center"
                                            >
                                                <source src={event.video} />
                                            </video>
                                        </CardItem>
                                        {/* <CardItem
                                        as="h1"
                                        className={cn(
                                            monoton.className,
                                            "text-center text-yellow w-full text-2xl mt-4"
                                        )}
                                    >
                                        {event.title}
                                    </CardItem> */}
                                    </div>
                                </CardContainer>
                            </Link>
                        );
                    })}
                </section>
            </div>
           {/* <Hackathon />*/}
        </>
    );
}
