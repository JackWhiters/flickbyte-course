"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { MuxData, Resource, Section } from "@prisma/client";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import ReactPlayer from "react-player";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import RichEditor from "@/components/custom/RichEditor";
import { Switch } from "@/components/ui/switch";
import ResourceForm from "@/components/sections/ResourceForm";
import Delete from "@/components/custom/Delete";
import PublishButton from "@/components/custom/PublishButton";
import FileUpload from "../custom/FileUpload"; // Ensure you have this component or replace with your own file upload component

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title is required and must be at least 2 characters long",
  }),
  description: z.string().optional(),
  videoUrl: z.string().url().optional(),
  isFree: z.boolean().optional(),
});

interface EditSectionFormProps {
  section: Section & { resources: Resource[]; muxData?: MuxData | null };
  courseId: string;
  isCompleted: boolean;
}

const EditSectionForm = ({
  section,
  courseId,
  isCompleted,
}: EditSectionFormProps) => {
  const router = useRouter();
  const [videoType, setVideoType] = useState<'none' | 'url' | 'file'>('none');
  const [isClient, setIsClient] = useState(false);

  // Initialize videoType based on section data only after component mounts
  useEffect(() => {
    if (section.videoUrl) {
      setVideoType('url');
    }
    setIsClient(true);
  }, [section.videoUrl]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: section.title,
      description: section.description || "",
      videoUrl: section.videoUrl || "",
      isFree: section.isFree,
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(
        `/api/courses/${courseId}/sections/${section.id}`,
        values
      );
      toast.success("Section Updated");
      router.refresh();
    } catch (err) {
      console.log("Failed to update the section", err);
      toast.error("Something went wrong!");
    }
  };

  const handleFileChange = (url?: string) => {
    form.setValue('videoUrl', url || "");
  };

  if (!isClient) {
    // Render nothing until the component has mounted
    return null;
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between mb-7">
        <Link href={`/instructor/courses/${courseId}/sections`}>
          <Button variant="outline" className="text-sm font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to curriculum
          </Button>
        </Link>

        <div className="flex gap-5 items-start">
          <PublishButton
            disabled={!isCompleted}
            courseId={courseId}
            sectionId={section.id}
            isPublished={section.isPublished}
            page="Section"
          />
          <Delete item="section" courseId={courseId} sectionId={section.id} />
        </div>
      </div>

      <h1 className="text-xl font-bold">Section Details</h1>
      <p className="text-sm font-medium mt-2">
        Complete this section with detailed information, good video and
        resources to give your students the best learning experience.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-5">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Title <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Introduction to Web Development"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <RichEditor
                    placeholder="What is this section about?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Switch Between Video URL and Upload */}
          <div className="my-5 flex flex-col gap-4">
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant={videoType === 'url' ? "default" : "outline"}
                onClick={() => setVideoType('url')}
                className={`flex-1 ${videoType === 'url' ? "bg-blue-500 text-white border-blue-500" : "text-blue-500 border-blue-500"}`}
              >
                Enter YouTube URL
              </Button>
              <Button
                type="button"
                variant={videoType === 'file' ? "default" : "outline"}
                onClick={() => setVideoType('file')}
                className={`flex-1 ${videoType === 'file' ? "bg-blue-500 text-white border-blue-500" : "text-blue-500 border-blue-500"}`}
              >
                Upload Video
              </Button>
            </div>

            {/* Preview Video */}
            {videoType !== 'none' && form.watch("videoUrl") && (
              <div className="relative my-5">
                <ReactPlayer
                  url={form.watch("videoUrl")}
                  controls
                  width="100%"
                  height="auto"
                  className="mx-auto max-w-full lg:max-w-3xl" // Ensure the video fits within the container
                />
              </div>
            )}
          </div>

          {/* Conditional Video URL Input */}
          {videoType === 'url' && (
            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Video URL <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: https://www.youtube.com/watch?v=abcd1234"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Conditional File Upload */}
          {videoType === 'file' && (
            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Upload Video
                  </FormLabel>
                  <FormControl>
                    <FileUpload
                      value={field.value || ""}
                      onChange={handleFileChange}
                      endpoint="sectionVideo"
                      page="Edit Section"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Accessibility Switch */}
          <FormField
            control={form.control}
            name="isFree"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Accessibility</FormLabel>
                  <FormDescription>
                    Everyone can access this section for FREE
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex gap-5 mt-6">
            <Link href={`/instructor/courses/${courseId}/sections`}>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </Form>

      <ResourceForm section={section} courseId={courseId} />
    </>
  );
};

export default EditSectionForm;
