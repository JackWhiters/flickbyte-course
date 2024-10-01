"use client";

import {
  Course,
  Progress,
  Purchase,
  Resource,
  Section,
} from "@prisma/client";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import axios from "axios";
import { File, Loader2, Lock } from "lucide-react";
import ReactPlayer from "react-player";

import { Button } from "@/components/ui/button";
import ReadText from "@/components/custom/ReadText";
import Link from "next/link";
import ProgressButton from "./ProgressButton";
import SectionMenu from "../layout/SectionMenu";

interface SectionsDetailsProps {
  course: Course & { sections: Section[] };
  section: Section;
  purchase: Purchase | null;
  resources: Resource[] | [];
  progress: Progress | null;
}

const SectionsDetails = ({
  course,
  section,
  purchase,
  resources,
  progress,
}: SectionsDetailsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const isLocked = !purchase && !section.isFree;

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  const buyCourse = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`/api/courses/${course.id}/checkout`);
      window.location.assign(response.data.url);
    } catch (err) {
      console.log("Failed to checkout course", err);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative px-6 py-4 flex flex-col gap-5">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <h1 className="text-2xl font-bold max-md:mb-4">{section.title}</h1>

        <div className="flex gap-4">
          <SectionMenu course={course} />
          {!purchase ? (
            <Button onClick={buyCourse}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <p>Buy this course</p>
              )}
            </Button>
          ) : (
            <ProgressButton
              courseId={course.id}
              sectionId={section.id}
              isCompleted={!!progress?.isCompleted}
            />
          )}
        </div>
      </div>

      <ReadText value={section.description!} />

      {isLocked ? (
        <div className="px-10 flex flex-col gap-5 items-center bg-[#FFF8EB]">
          <Lock className="h-8 w-8" />
          <p className="text-sm font-bold">
            Video for this section is locked! Please buy the course to access it.
          </p>
        </div>
      ) : (
        <div className="relative my-5 video-container">
          <ReactPlayer
            url={section.videoUrl || ""}
            controls
            width="100%"
            height="auto"
            className="max-w-full mx-auto md:max-w-[600px]"
            config={{
              file: {
                attributes: {
                  controlsList: "nodownload", // Disables download button
                  disablePictureInPicture: true, // Disables PiP mode
                  onContextMenu: (e: { preventDefault: () => any; }) => e.preventDefault(), // Disables right-click menu
                },
              },
            }}
          />
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold mb-5">Resources</h2>
        {resources.map((resource) => (
          <Link
            key={resource.id}
            href={resource.fileUrl}
            target="_blank"
            className="flex items-center bg-[#FFF8EB] rounded-lg text-sm font-medium p-3"
          >
            <File className="h-4 w-4 mr-4" />
            {resource.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SectionsDetails;
