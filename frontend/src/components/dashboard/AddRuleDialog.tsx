import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateRule } from '@/hooks/useSenderRules'
import { useToast } from '@/components/ui/toaster'

export function AddRuleDialog() {
  const [open, setOpen] = useState(false)
  const [sender, setSender] = useState('')
  const createRule = useCreateRule()
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sender.trim()) return
    try {
      await createRule.mutateAsync(sender.trim())
      toast({ title: 'Rule added', description: sender.trim() })
      setSender('')
      setOpen(false)
    } catch {
      toast({ title: 'Failed to add rule', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Rule
      </Button>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Sender Rule</DialogTitle>
          <DialogDescription>
            Emails from this sender will be included in cleanup runs.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="sender">Sender email or domain</Label>
            <Input
              id="sender"
              type="text"
              placeholder="noreply@example.com"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size="sm" disabled={createRule.isPending || !sender.trim()}>
              {createRule.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Rule
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
