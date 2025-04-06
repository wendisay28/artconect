import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BlogPost {
  id: string;
  title: string;
  content: string; // Assuming you have a content field
  excerpt: string;
  imageUrl?: string;
  date: string;
}

interface EditPostFormProps {
  post: BlogPost;
  onPostUpdated: () => void;
}

const EditPostForm: React.FC<EditPostFormProps> = ({ post, onPostUpdated }) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
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
      const response = await fetch(`/api/blog/posts/${post.id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Post updated successfully!",
        });
        onPostUpdated();
      } else {
        toast({
          title: "Error",
          description: "Error updating post.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error updating post.",
        variant: "destructive",
      });
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="image">Image (optional)</Label>
        <Input type="file" id="image" onChange={handleImageChange} />
      </div>
      <Button type="submit">Update Post</Button>
    </form>
  );
};

export default EditPostForm;