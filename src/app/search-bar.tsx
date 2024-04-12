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
import { Dispatch, SetStateAction, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { DeleteIcon, Loader2, SearchIcon, Trash2 } from "lucide-react";
import { Doc } from "../../convex/_generated/dataModel";

const formSchema = z.object({
  query: z.string().min(0).max(200),
});

export function SearchBar({query, setQuery}: {query: string, setQuery: Dispatch<SetStateAction<string>>}) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setQuery(values.query)
  }

  return (
    <div>
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex gap-5 items-center relative"
        >
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} placeholder="Search your files here..." className="w-[500px]"/>
                </FormControl>
                <FormMessage /> 
              </FormItem>
            )}
          />
          <DeleteIcon className="absolute right-[140px] cursor-pointer" onClick={()=>{form.reset(); setQuery("")}}/>
          <Button size={"sm"} type="submit" disabled={form.formState.isSubmitting}>
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
