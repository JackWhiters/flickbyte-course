import { Course, Section } from "@prisma/client";
import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import Link from "next/link";

interface SectionMenuProps {
  course: Course & { sections: Section[] };
}

const SectionMenu = ({ course }: SectionMenuProps) => {
  // Urutkan sections berdasarkan position
  const sortedSections = course.sections.sort((a, b) => a.position - b.position);

  return (
    <div className="z-60 md:hidden">
      <Sheet>
        <SheetTrigger>
          <Button>Sections</Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col">
          <Link
            href={`/courses/${course.id}/overview`}
            className={`p-3 rounded-lg hover:bg-[#FFF8EB] mt-4`}
          >
            Overview
          </Link>
          {sortedSections.map((section) => (
            <Link
              key={section.id}
              href={`/courses/${course.id}/sections/${section.id}`}
              className="p-3 rounded-lg hover:bg-[#FFF8EB] mt-4"
            >
              {section.title}
            </Link>
          ))}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SectionMenu;
