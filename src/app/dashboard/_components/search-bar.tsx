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

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { DeleteIcon, Loader2, SearchIcon, Trash2 } from "lucide-react";

const formSchema = z.object({
  query: z.string().min(0).max(200),
});

export function SearchBar({
  query,
  setQuery,
}: {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
}) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setQuery(values.query);
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
                  <div className="flex items-center relative">
                    <Input
                      {...field}
                      placeholder="Search your files here..."
                      className="w-[500px]"
                    />
                    <DeleteIcon
                      className="cursor-pointer absolute right-3"
                      onClick={() => {
                        form.reset();
                        setQuery("");
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            size={"sm"}
            type="submit"
            disabled={form.formState.isSubmitting}
          >
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
