"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, SearchIcon } from "lucide-react";
import { Doc } from "../../convex/_generated/dataModel";

const formSchema = z.object({
  query: z.string().min(0).max(200),
});

export function SearchBar() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  const fileref = form.register("query");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      form.reset();

      toast({
        variant: "success",
        title: "All Right!! 🙌",
        description: "Your file has been uploaded",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Something went wrong! 😕",
        description: "Your file couldn't be uploaded. Try again later.",
      });
    }
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex gap-5 items-center"
        >
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} placeholder="Search your files here..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            ) : (
              <SearchIcon className="h-5 w-5 mr-3" />
            )}
            Search
          </Button>
        </form>
      </Form>
    </div>
  );
}
