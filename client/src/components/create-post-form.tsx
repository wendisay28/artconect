import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface CreatePostFormProps {
  onPostCreated: () => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostCreated }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch("/api/blog/posts", {
        method: "POST",
        body: formData,
      });

      if (response.status === 201) {
        setTitle("");
        setContent("");
        setImage(null);
        onPostCreated();
        toast({
          title: "Post created successfully!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error creating post.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating post.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          type="text"
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="image">Image (optional)</Label>
        <Input type="file" id="image" name="image" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} />
      </div>
      <Button type="submit">Create Post</Button>
    </form>
  );
};

export default CreatePostForm;