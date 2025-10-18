import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, ArrowLeft, LogOut, Plus, MoreVertical } from "lucide-react";
import type { Task } from "@shared/schema";

export default function QueueManagement() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskProperty, setNewTaskProperty] = useState("");

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    enabled: isAuthenticated,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; propertyAnalysisId?: string }) => {
      return await apiRequest("POST", "/api/tasks", {
        title: data.title,
        description: data.description,
        status: "todo",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskProperty("");
      setIsCreateDialogOpen(false);
      toast({
        title: "Task Created",
        description: "New task has been added to the queue.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Failed to Create Task",
        description: error.message || "An error occurred while creating the task.",
        variant: "destructive",
      });
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/tasks/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Failed to Update Task",
        description: error.message || "An error occurred while updating the task.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide a task title.",
        variant: "destructive",
      });
      return;
    }

    createTaskMutation.mutate({
      title: newTaskTitle,
      description: newTaskDescription,
    });
  };

  const handleMoveTask = (taskId: string, newStatus: "todo" | "in_progress" | "done") => {
    updateTaskStatusMutation.mutate({ id: taskId, status: newStatus });
  };

  const getTasksByStatus = (status: "todo" | "in_progress" | "done") => {
    return tasks.filter(task => task.status === status);
  };

  const getStatusBadgeVariant = (status: "todo" | "in_progress" | "done") => {
    switch (status) {
      case "todo": return "secondary";
      case "in_progress": return "default";
      case "done": return "outline";
    }
  };

  const columns: { status: "todo" | "in_progress" | "done"; label: string; color: string }[] = [
    { status: "todo", label: "To-Do", color: "bg-muted" },
    { status: "in_progress", label: "In Progress", color: "bg-primary/5" },
    { status: "done", label: "Done", color: "bg-chart-2/5" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              data-testid="button-back-dashboard"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-primary" />
              <span className="text-xl font-semibold">Queue Management</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-task">
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Add a new task to the project queue
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="task-title">Task Title *</Label>
                    <Input
                      id="task-title"
                      data-testid="input-task-title"
                      placeholder="e.g., Complete EHP review"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea
                      id="task-description"
                      data-testid="textarea-task-description"
                      placeholder="Provide details about the task..."
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateTask} 
                    data-testid="button-submit-task"
                    disabled={createTaskMutation.isPending}
                  >
                    {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Avatar className="w-9 h-9">
              <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              data-testid="button-logout"
              onClick={() => window.location.href = '/api/logout'}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {tasksLoading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-10 w-16" />
                </Card>
              ))}
            </>
          ) : (
            columns.map(column => (
              <Card key={column.status} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{column.label}</p>
                    <p className="text-3xl font-semibold">{getTasksByStatus(column.status).length}</p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(column.status)}>
                    {getTasksByStatus(column.status).length}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-3 gap-6">
          {columns.map(column => (
            <div key={column.status} className="space-y-4">
              <div className={`${column.color} rounded-lg p-4`}>
                <h2 className="font-semibold">{column.label}</h2>
                <p className="text-sm text-muted-foreground">
                  {getTasksByStatus(column.status).length} {getTasksByStatus(column.status).length === 1 ? 'task' : 'tasks'}
                </p>
              </div>

              <div className="space-y-3" data-testid={`column-${column.status}`}>
                {tasksLoading ? (
                  <>
                    {[...Array(2)].map((_, i) => (
                      <Card key={i} className="p-4">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-full" />
                      </Card>
                    ))}
                  </>
                ) : getTasksByStatus(column.status).length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-sm text-muted-foreground">No tasks</p>
                  </Card>
                ) : (
                  getTasksByStatus(column.status).map(task => (
                    <Card
                      key={task.id}
                      className="p-4 space-y-3 hover-elevate active-elevate-2 transition-all"
                      data-testid={`task-${task.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm">{task.title}</h3>
                        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </div>

                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex gap-2 pt-2 border-t">
                        {column.status !== "todo" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            onClick={() => handleMoveTask(task.id, column.status === "in_progress" ? "todo" : "in_progress")}
                            data-testid={`button-move-back-${task.id}`}
                            disabled={updateTaskStatusMutation.isPending}
                          >
                            ← {column.status === "in_progress" ? "To-Do" : "In Progress"}
                          </Button>
                        )}
                        {column.status !== "done" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-7 text-xs"
                            onClick={() => handleMoveTask(task.id, column.status === "todo" ? "in_progress" : "done")}
                            data-testid={`button-move-forward-${task.id}`}
                            disabled={updateTaskStatusMutation.isPending}
                          >
                            {column.status === "todo" ? "In Progress" : "Done"} →
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
