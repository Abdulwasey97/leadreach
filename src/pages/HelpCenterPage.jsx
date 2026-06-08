import { useRef, useState } from 'react'
import Sidebar from '../components/layout/Sidebar'

const editorActions = [
  { id: 'bold', label: 'B', command: 'bold', title: 'Bold' },
  { id: 'italic', label: 'I', command: 'italic', title: 'Italic' },
  { id: 'underline', label: 'U', command: 'underline', title: 'Underline' },
  { id: 'list', label: 'List', command: 'insertUnorderedList', title: 'Bulleted list' },
]

function HelpCenterPage() {
  const editorRef = useRef(null)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [attachmentName, setAttachmentName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleEditorCommand = (command) => {
    editorRef.current?.focus()
    document.execCommand(command, false, null)
    setMessage(editorRef.current?.innerHTML || '')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)

    window.dispatchEvent(
      new CustomEvent('zoho-toast', {
        detail: {
          type: 'success',
          message: 'Help request submitted successfully.',
        },
      }),
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <Sidebar />

        <main className="min-w-0 flex-1 p-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="border-b border-slate-100 pb-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Support Desk
                </p>
                <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  Help Center
                </h2>
              </div>
            </div>

            <form className="mt-5 w-full space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Subject
                  </span>
                  <input
                    type="text"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="Briefly describe the issue"
                    required
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  />
                </label>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Details
                </span>
                <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100">
                  <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50 px-2 py-2">
                    {editorActions.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        title={action.title}
                        onClick={() => handleEditorCommand(action.command)}
                        className="h-8 min-w-8 cursor-pointer rounded-md px-2 text-xs font-bold text-slate-600 transition hover:bg-white hover:text-cyan-700"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                  <div
                    ref={editorRef}
                    contentEditable
                    role="textbox"
                    aria-label="Support request details"
                    onInput={(event) => setMessage(event.currentTarget.innerHTML)}
                    className="min-h-56 w-full px-3 py-3 text-sm leading-6 text-slate-800 outline-none empty:before:text-slate-400 empty:before:content-['Write_your_message_here...']"
                  />
                </div>
              </div>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Attachment
                </span>
                <div className="mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                  <input
                    type="file"
                    onChange={(event) =>
                      setAttachmentName(event.target.files?.[0]?.name || '')
                    }
                    className="block cursor-pointer text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-cyan-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-cyan-700"
                  />
                  {attachmentName ? (
                    <span className="text-sm font-medium text-slate-600">
                      {attachmentName}
                    </span>
                  ) : null}
                </div>
              </label>

              <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={!subject.trim() || !message.trim()}
                  className="cursor-pointer rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Submit Request
                </button>
                {submitted ? (
                  <p className="text-sm font-medium text-emerald-600">
                    Request captured.
                  </p>
                ) : null}
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  )
}

export default HelpCenterPage
