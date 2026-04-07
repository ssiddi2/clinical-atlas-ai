import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ChevronDown, ChevronRight, Star, GripVertical, Edit2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Topic {
  id: string;
  course_id: string;
  parent_topic_id: string | null;
  title: string;
  sort_order: number;
  is_high_yield: boolean;
  children?: Topic[];
}

interface Props {
  courseId: string;
  isInstructor: boolean;
}

export default function CurriculumBuilder({ courseId, isInstructor }: Props) {
  const { toast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [addingTo, setAddingTo] = useState<string | null>(null); // parent_topic_id or "root"
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const loadTopics = async () => {
    const { data } = await supabase
      .from("course_topics")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order");
    if (data) setTopics(data as Topic[]);
    setLoading(false);
  };

  useEffect(() => { loadTopics(); }, [courseId]);

  const buildTree = (items: Topic[], parentId: string | null = null): Topic[] => {
    return items
      .filter(t => t.parent_topic_id === parentId)
      .map(t => ({ ...t, children: buildTree(items, t.id) }));
  };

  const tree = buildTree(topics);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAdd = async (parentId: string | null) => {
    if (!newTitle.trim()) return;
    const siblings = topics.filter(t => t.parent_topic_id === parentId);
    const { error } = await supabase.from("course_topics").insert({
      course_id: courseId,
      parent_topic_id: parentId,
      title: newTitle.trim(),
      sort_order: siblings.length,
    });
    if (!error) {
      setNewTitle("");
      setAddingTo(null);
      if (parentId) setExpandedIds(prev => new Set(prev).add(parentId));
      loadTopics();
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("course_topics").delete().eq("id", id);
    loadTopics();
  };

  const handleToggleHighYield = async (id: string, current: boolean) => {
    await supabase.from("course_topics").update({ is_high_yield: !current }).eq("id", id);
    loadTopics();
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) return;
    await supabase.from("course_topics").update({ title: editTitle.trim() }).eq("id", id);
    setEditingId(null);
    loadTopics();
  };

  const getDepthLabel = (parentId: string | null): string => {
    if (!parentId) return "System";
    const parent = topics.find(t => t.id === parentId);
    if (!parent) return "Topic";
    if (!parent.parent_topic_id) return "Topic";
    return "Subtopic";
  };

  const renderTopic = (topic: Topic, depth: number = 0) => {
    const isExpanded = expandedIds.has(topic.id);
    const hasChildren = (topic.children?.length || 0) > 0;
    const isEditing = editingId === topic.id;
    const isAddingChild = addingTo === topic.id;

    return (
      <div key={topic.id} style={{ marginLeft: depth * 20 }}>
        <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-muted/50 group">
          {isInstructor && <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 cursor-grab" />}
          
          <button onClick={() => toggleExpand(topic.id)} className="p-0.5">
            {hasChildren ? (
              isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            ) : <div className="w-3.5" />}
          </button>

          {isEditing ? (
            <div className="flex items-center gap-1 flex-1">
              <Input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="h-7 text-sm"
                autoFocus
                onKeyDown={e => e.key === "Enter" && handleSaveEdit(topic.id)}
              />
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleSaveEdit(topic.id)}>
                <Check className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingId(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <>
              <span className="text-sm font-medium text-foreground flex-1">{topic.title}</span>
              {topic.is_high_yield && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[10px] px-1.5 py-0">
                  <Star className="h-2.5 w-2.5 mr-0.5 fill-yellow-400" /> HY
                </Badge>
              )}
            </>
          )}

          {isInstructor && !isEditing && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setAddingTo(topic.id); setNewTitle(""); }}>
                <Plus className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setEditingId(topic.id); setEditTitle(topic.title); }}>
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleToggleHighYield(topic.id, topic.is_high_yield)}>
                <Star className={`h-3 w-3 ${topic.is_high_yield ? "fill-yellow-400 text-yellow-400" : ""}`} />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => handleDelete(topic.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {isAddingChild && (
          <div className="flex items-center gap-2 ml-8 my-1">
            <Input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder={`New ${getDepthLabel(topic.id)}...`}
              className="h-7 text-sm"
              autoFocus
              onKeyDown={e => e.key === "Enter" && handleAdd(topic.id)}
            />
            <Button size="sm" className="h-7 text-xs" onClick={() => handleAdd(topic.id)}>Add</Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAddingTo(null)}>Cancel</Button>
          </div>
        )}

        {isExpanded && topic.children?.map(child => renderTopic(child, depth + 1))}
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-3">
      {isInstructor && (
        <div className="flex items-center gap-2">
          {addingTo === "root" ? (
            <>
              <Input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="New System (e.g., Cardiology)..."
                className="h-8 text-sm"
                autoFocus
                onKeyDown={e => e.key === "Enter" && handleAdd(null)}
              />
              <Button size="sm" className="h-8" onClick={() => handleAdd(null)}>Add</Button>
              <Button size="sm" variant="ghost" className="h-8" onClick={() => setAddingTo(null)}>Cancel</Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => { setAddingTo("root"); setNewTitle(""); }}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add System
            </Button>
          )}
        </div>
      )}

      {tree.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">No curriculum defined yet</p>
          {isInstructor && <p className="text-xs text-muted-foreground mt-1">Add systems, topics, and subtopics to structure your course</p>}
        </div>
      ) : (
        <Card className="bg-card/50">
          <CardContent className="p-3">
            {tree.map(t => renderTopic(t))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
