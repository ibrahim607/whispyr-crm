"use client"

import React, { useRef, useState } from 'react'

import { useLeadAttachments, useUploadAttachment, useDeleteAttachment } from '@/lib/tanstack/useLeadAttachments'
import { formatDistanceToNow } from 'date-fns'
import { Paperclip, FileText, ImageIcon, FileIcon, Trash2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { formatBytes } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function getFileIcon(mimeType: string) {
    if (mimeType?.startsWith('image/')) return <ImageIcon className="h-4 w-4 text-orange-500" />
    if (mimeType === 'application/pdf') return <FileText className="h-4 w-4 text-gray-500" />
    return <FileIcon className="h-4 w-4 text-gray-500" />
}

export default function FilesTab({ leadId }: { leadId: string }) {

    const { data: files, isLoading } = useLeadAttachments(leadId)
    const { mutate: uploadFile, isPending } = useUploadAttachment(leadId)
    const { mutate: deleteFile } = useDeleteAttachment(leadId)
    
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    const handleDelete = (attachmentId: string, fileName: string) => {
        const loadingToast = toast.loading(`Deleting ${fileName}...`);
        deleteFile(attachmentId, {
            onSuccess: () => {
                toast.success(`${fileName} deleted successfully`, { id: loadingToast })
            },
            onError: (err) => {
                toast.error(err.message || 'Failed to delete file', { id: loadingToast })
            }
        });
    }

    const handleUpload = (file: File) => {
        const loadingToast = toast.loading(`Uploading ${file.name}...`)
        uploadFile(file, {
            onSuccess: () => {
                toast.success(`${file.name} uploaded successfully`, { id: loadingToast })
            },
            onError: (err) => {
                toast.error(err.message || 'Failed to upload file', { id: loadingToast })
            }
        })
    }

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleUpload(e.target.files[0])
            // clear input to allow same file selection again if needed
            e.target.value = ''
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleUpload(e.dataTransfer.files[0])
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    return (
        <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Dropzone */}
            <div 
                className={`p-10 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
            >
                <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={onFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.mp4,.mpeg,.mov,.txt"
                />
                <Paperclip className="h-6 w-6 text-gray-400 mb-3" />
                <h3 className="text-sm font-semibold text-gray-700">Drop files here or click to upload</h3>
                <p className="text-xs text-gray-500 mt-1">PDF, DOC, XLS, PNG up to 10MB</p>
                {isPending && <p className="text-xs text-primary mt-2">Uploading...</p>}
            </div>

            {/* Files List */}
            <div className="border rounded-md bg-white overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-gray-50/50 border-b">
                        <tr>
                            <th className="px-6 py-3 font-medium">FILE NAME</th>
                            <th className="px-6 py-3 font-medium text-right">SIZE</th>
                            <th className="px-6 py-3 font-medium">UPLOADED BY</th>
                            <th className="px-6 py-3 font-medium">DATE</th>
                            <th className="px-6 py-3 font-medium">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8"><div className="flex justify-center"><Spinner /></div></td>
                            </tr>
                        ) : !files || files.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No files uploaded yet.</td>
                            </tr>
                        ) : (
                            files.map((file) => (
                                <tr key={file.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        {getFileIcon(file.mimeType)}
                                        <span className="font-medium text-gray-700">{file.fileName}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-muted-foreground">
                                        {formatBytes(file.sizeBytes)}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {file.uploadedBy?.name || 'Unknown User'}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                        {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                                    </td>
                                    <td className="px-6 py-4 flex justify-end gap-3 items-center">
                                        <a 
                                            href={file.downloadUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium transition-all hover:-translate-y-[1px] cursor-pointer"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </a>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button 
                                                    className="p-2 text-red-500 hover:text-red-700 bg-red-50/50 hover:bg-red-50 rounded-lg transition-all hover:scale-105 cursor-pointer"
                                                    title="Delete Attachment"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the file "{file.fileName}". This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction 
                                                        onClick={() => handleDelete(file.id, file.fileName)}
                                                        className="bg-red-600 hover:bg-red-700 text-white"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
