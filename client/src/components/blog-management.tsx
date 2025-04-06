import React from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CreatePostForm from "@/components/create-post-form";
import EditPostForm from "@/components/edit-post-form"; // Assuming this component exists

// Define the BlogPost interface with necessary properties
interface BlogPost {
  id: string;
  title: string;
  excerpt: string; // Or content, depending on what you need to display
  imageUrl?: string;
  date: string;
  likes: number;
  dislikes: number;
  views: number;
}

interface BlogManagementProps {
  artistId?: number;
}

const BlogManagement: React.FC<BlogManagementProps> = ({ artistId }) => {
  const [isCreating, setIsCreating] = React.useState(false);
  const [editingPost, setEditingPost] = React.useState<BlogPost | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch blog posts for the artist
  const { data: blogPosts, isLoading, error } = useQuery<BlogPost[]>({ 
    queryKey: ["/api/blog/posts", artistId],
    queryFn: async () => {
      // Ensure artistId is valid before fetching
      if (!artistId) return []; 
      const response = await fetch(`/api/blog/posts?artistId=${artistId}`);
      if (!response.ok) {
        throw new Error("Error fetching blog posts");
      }
      return response.json();
    },
    enabled: !!artistId, // Only run query if artistId is available
  });

  // Mutation for deleting a post
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/blog/posts/${postId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Error deleting blog post");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts", artistId] });
      toast({
        title: "Post deleted",
        description: "The blog post has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const handleDelete = (postId: string) => {
    // Add confirmation dialog here if needed
    deletePostMutation.mutate(postId);
  };

  // Placeholder mutation logic for like/dislike - replace with actual API calls
  const handleLike = async (postId: string) => {
    console.log(`Liking post ${postId}`);
    // TODO: Implement actual API call for liking
    toast({ title: "Like registered (Placeholder)" });
    // Invalidate query to refresh data after mutation
    // queryClient.invalidateQueries({ queryKey: ["/api/blog/posts", artistId] });
  };

  const handleDislike = async (postId: string) => {
    console.log(`Disliking post ${postId}`);
    // TODO: Implement actual API call for disliking
    toast({ title: "Dislike registered (Placeholder)" });
    // Invalidate query to refresh data after mutation
    // queryClient.invalidateQueries({ queryKey: ["/api/blog/posts", artistId] });
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsCreating(!isCreating)}>
        {isCreating ? "Cancel" : "Create New Post"}
      </Button>

      {isCreating && (
        <CreatePostForm
          onPostCreated={() => {
            queryClient.invalidateQueries({
              queryKey: ["/api/blog/posts", artistId],
            });
            setIsCreating(false);
            // Toast is already shown in CreatePostForm on success
          }}
        />
      )}

      {editingPost && (
        <EditPostForm
          post={editingPost}
          onPostUpdated={() => {
            queryClient.invalidateQueries({
              queryKey: ["/api/blog/posts", artistId],
            });
            setEditingPost(null);
            // Toast is already shown in EditPostForm on success
          }}
        />
      )}

      {isLoading && <p>Loading blog posts...</p>}
      {error && <p>Error loading posts: {error.message}</p>}
      {deletePostMutation.isPending && <p>Deleting post...</p>}
      {deletePostMutation.error && <p>Error deleting post: {deletePostMutation.error.message}</p>} 

      {!isLoading && !error && blogPosts && blogPosts.length > 0 ? (
        <ul>
          {blogPosts.map((post) => (
            <li
              key={post.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b gap-2"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{post.title}</p>
                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                  <span>Likes: {post.likes}</span>
                  <span>Dislikes: {post.dislikes}</span>
                  <span>Views: {post.views}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
                 {/* Like/Dislike buttons - Add functionality later */}
                 <Button variant="outline" size="sm" onClick={() => handleLike(post.id)} className="text-xs">
                   Like
                 </Button>
                 <Button variant="outline" size="sm" onClick={() => handleDislike(post.id)} className="text-xs">
                   Dislike
                 </Button>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() =>
                     setEditingPost(editingPost?.id === post.id ? null : post)
                   }
                   className="text-xs"
                 >
                   {editingPost?.id === post.id ? "Cancel" : "Edit"}
                 </Button>
                 <Button
                   variant="destructive"
                   size="sm"
                   disabled={deletePostMutation.isPending} // Use isPending for loading state
                   onClick={() => handleDelete(post.id)}
                   className="text-xs"
                 >
                   Delete
                 </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        !isLoading && <p>No blog posts found for this artist.</p>
      )}
    </div>
  );
};

export default BlogManagement;
