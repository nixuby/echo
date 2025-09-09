export type MediaPreviewDialogProps = {
    url: string;
};

// Dialog for media (photo, gif, or video) preview
export default function MediaPreviewDialog({ url }: MediaPreviewDialogProps) {
    return (
        <img
            src={url}
            alt='Media Preview'
            className='max-h-[75vh] max-w-[75vw]'
        />
    );
}
