/**
 * TaskItem — an expandable task card with subtask hierarchy.
 * Dark Forest styling with spring-bounce checkboxes.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, Sparkles, Trash2 } from 'lucide-react'
import SubtaskList from './SubtaskList'
import TaskProgressBar from './TaskProgressBar'

const PRIORITY_COLORS = { 1: 'var(--coral)', 2: 'var(--amber)', 3: 'var(--sage)', 4: 'var(--lavender)', 5: 'var(--muted)' }
const PRIORITY_LABELS = { 1: 'HIGH', 2: 'MED', 3: 'LOW', 4: 'AI', 5: 'OPT' }

export default function TaskItem({
  task,
  index = 0,
  isRecommended = false,
  hideCompleted = false,
  onToggleDone,
  onEditTitle,
  onEditPriority,
  onEditDays,
  onDeleteTask,
  onToggleSubtask,
  onEditSubtask,
  onEditSubtaskPriority,
  onEditSubtaskDays,
  onAddSubtask,
  onDeleteSubtask,
  onReorderSubtasks,
}) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)

  if (!task) return null
  if (hideCompleted && task.done) return null

  const subtasks = task.subtasks ?? []
  const completedSubs = subtasks.filter((s) => s.done).length
  const priorityColor = PRIORITY_COLORS[task.priority] ?? 'var(--fog)'

  const commitEdit = () => {
    const t = draft.trim()
    if (t && t !== task.title) onEditTitle?.(task.id, t)
    setEditing(false)
  }

  const handleHeaderClick = (e) => {
    if (!subtasks.length) return
    if (e.target.closest('[data-no-expand]')) return
    setExpanded(prev => !prev)
  }

  return (
    <motion.div
      layout
      className={task.done ? "task-row done" : "task-row"}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 0,
        padding: 0,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 'var(--r-md)',
        marginBottom: 10,
        transition: 'all 0.3s',
      }}
    >
      {/* Task header row */}
      <div
        onClick={handleHeaderClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 18px',
          cursor: subtasks.length > 0 ? 'pointer' : 'default',
        }}
        className="group"
      >
        {/* Expand toggle */}
        <button
          data-no-expand
          onClick={() => subtasks.length > 0 && setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            cursor: subtasks.length > 0 ? 'pointer' : 'default',
            color: subtasks.length > 0 ? 'var(--fog)' : 'transparent',
            display: 'flex',
            padding: 2,
            flexShrink: 0,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => { if(subtasks.length > 0) e.currentTarget.style.color = 'white'}}
          onMouseLeave={e => { if(subtasks.length > 0) e.currentTarget.style.color = 'var(--fog)'}}
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Priority badge */}
        <div
          data-no-expand
          title={`Priority ${task.priority}${task.urgency_score ? ` (Urgency: ${task.urgency_score})` : ''} - Click to cycle`}
          onClick={() => {
            const nextP = task.priority >= 5 ? 1 : task.priority + 1
            onEditPriority?.(task.id, nextP)
          }}
          className="font-mono"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px 8px',
            borderRadius: 'var(--r-sm)',
            background: `rgba(${
              task.priority === 1 ? '216,110,110' :
              task.priority === 2 ? '212,124,63' :
              task.priority === 3 ? '146,171,155' :
              task.priority === 4 ? '123,111,160' :
              '148,163,184'
            }, 0.1)`,
            color: priorityColor,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.05em',
            flexShrink: 0,
            cursor: 'pointer',
            borderLeft: `3px solid ${priorityColor}`,
            minWidth: 40,
            textAlign: 'center',
            transition: 'all 0.2s'
          }}
        >
          {PRIORITY_LABELS[task.priority] || `P${task.priority}`}
        </div>

        {/* Done checkbox (Left side in new design) */}
        <button
          data-no-expand
          onClick={() => onToggleDone?.(task.id)}
          className="cb"
          style={{
            width: 24,
            height: 24,
            border: `2px solid var(--sage)`,
            borderRadius: 'var(--r-sm)',
            background: task.done ? 'var(--sage)' : 'transparent',
            flexShrink: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.25s cubic-bezier(.34, 1.56, .64, 1)',
            transform: task.done ? 'scale(1.15)' : 'scale(1)',
          }}
        >
          {task.done && <span style={{ color: 'var(--forest-deep)', fontSize: 14, fontWeight: 700 }}>✓</span>}
        </button>

        {/* Task title */}
        <div style={{ flex: 1, minWidth: 0, marginLeft: 2 }}>
          {editing ? (
            <input
              aria-label="Task title draft"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false) }}
              style={{
                width: '100%',
                background: 'var(--forest-card2)',
                border: '1px solid var(--sage)',
                borderRadius: 'var(--r-sm)',
                padding: '4px 10px',
                color: 'white',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                outline: 'none',
              }}
            />
          ) : (
            <span
              onClick={() => setEditing(true)}
              className="cbl"
              title="Click to edit"
              style={{
                fontSize: 15,
                fontWeight: task.done ? 400 : 500,
                color: task.done ? 'var(--muted)' : 'white',
                textDecoration: task.done ? 'line-through' : 'none',
                cursor: 'text',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s'
              }}
            >
              {task.title}
            </span>
          )}
          {/* Subtitle: description */}
          {task.description && !editing && (
            <span style={{ fontSize: 12, color: 'var(--fog)', display: 'block', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: task.done ? 0.5 : 1 }}>
              {task.description}
            </span>
          )}
        </div>

        {/* AI Tag */}
        {!task.done && task.id && (
           <span className="cai font-mono" style={{ fontSize: 10, fontWeight: 700, color: 'var(--lavender)', opacity: 0.8, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(123,111,160,0.1)', padding: '2px 8px', borderRadius: 'var(--r-pill)' }}>
             <Sparkles size={10} /> AI
           </span>
        )}

        {/* Due offset */}
        {task.suggested_due_offset_days != null && (
          <div
            data-no-expand
            style={{ 
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-sm)',
            padding: '4px 8px', border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <span className="font-mono" style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Day</span>
            <input 
              aria-label="Task due offset days"
              type="number" min="0"
              value={task.suggested_due_offset_days}
              onChange={e => onEditDays?.(task.id, parseInt(e.target.value) || 0)}
              className="font-mono"
              style={{
                width: 40,
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: 12,
                fontWeight: 700,
                textAlign: 'center',
                outline: 'none',
                padding: '0 2px',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderBottomColor = 'var(--sage)'}
              onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.2)'}
            />
          </div>
        )}

        {/* Delete (hover) */}
        <button
            data-no-expand
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDeleteTask?.(task.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--coral)', display: 'flex', padding: 6, opacity: 0.7 }}
            onMouseEnter={e => { e.currentTarget.style.opacity = 1 }}
            onMouseLeave={e => { e.currentTarget.style.opacity = 0.7 }}
        >
            <Trash2 size={16} />
        </button>
      </div>

      {/* Progress bar (only when subtasks exist) */}
      {subtasks.length > 0 && (
        <div style={{ padding: '0 18px 12px 18px' }}>
          <TaskProgressBar completed={completedSubs} total={subtasks.length} />
        </div>
      )}

      {/* Subtask list — animated expand */}
      <AnimatePresence>
        {expanded && subtasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ padding: '0 18px 14px', overflow: 'hidden' }}
          >
            <SubtaskList
              subtasks={subtasks}
              onToggleDone={(sid) => onToggleSubtask?.(task.id, sid)}
              onEdit={(sid, t) => onEditSubtask?.(task.id, sid, t)}
              onEditPriority={(sid, p) => onEditSubtaskPriority?.(task.id, sid, p)}
              onEditDays={(sid, d) => onEditSubtaskDays?.(task.id, sid, d)}
              onAdd={(t) => onAddSubtask?.(task.id, t)}
              onDelete={(sid) => onDeleteSubtask?.(task.id, sid)}
              onReorder={(order) => onReorderSubtasks?.(task.id, order)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
