import { Trash2, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AddRuleDialog } from './AddRuleDialog'
import { useSenderRules, useToggleRule, useDeleteRule } from '@/hooks/useSenderRules'
import { useToast } from '@/components/ui/toaster'
import type { SenderRule } from '@/types'

export function SenderRulesTable() {
  const { data: rules, isLoading, isError } = useSenderRules()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Sender Rules</h2>
          <p className="text-xs text-muted-foreground">
            {rules?.length ?? 0} rule{rules?.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <AddRuleDialog />
      </div>

      <div className="rounded-lg border">
        {isLoading && (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
        {isError && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Could not load rules — backend offline?
          </p>
        )}
        {!isLoading && !isError && rules?.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No rules yet. Add one to get started.
          </p>
        )}
        {!isLoading && !isError && rules && rules.length > 0 && (
          <ul>
            <AnimatePresence initial={false}>
              {rules.map((rule, i) => (
                <motion.li
                  key={rule.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className={i < rules.length - 1 ? 'border-b' : ''}
                >
                  <RuleRow rule={rule} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  )
}

function RuleRow({ rule }: { rule: SenderRule }) {
  const toggleRule = useToggleRule()
  const deleteRule = useDeleteRule()
  const { toast } = useToast()

  async function handleToggle(active: boolean) {
    try {
      await toggleRule.mutateAsync({ id: rule.id, active })
    } catch {
      toast({ title: 'Failed to update rule', variant: 'destructive' })
    }
  }

  async function handleDelete() {
    try {
      await deleteRule.mutateAsync(rule.id)
      toast({ title: 'Rule removed', description: rule.sender })
    } catch {
      toast({ title: 'Failed to delete rule', variant: 'destructive' })
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Switch
        checked={rule.active}
        onCheckedChange={handleToggle}
        disabled={toggleRule.isPending}
        aria-label={`Toggle rule for ${rule.sender}`}
      />
      <span className="flex-1 truncate font-mono text-sm">{rule.sender}</span>
      <span className={`text-xs ${rule.active ? 'text-emerald-600' : 'text-muted-foreground'}`}>
        {rule.active ? 'Active' : 'Inactive'}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={deleteRule.isPending}
            className="shrink-0 text-muted-foreground hover:text-destructive"
            aria-label={`Delete rule for ${rule.sender}`}
          >
            {deleteRule.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete rule</TooltipContent>
      </Tooltip>
    </div>
  )
}
