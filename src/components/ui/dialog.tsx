'use client';

import { cn } from '@/lib/utils';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { m, useReducedMotion } from 'motion/react';

const backdropMotion = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.26 } },
	exit: { opacity: 0, transition: { duration: 0.16 } },
};
const reducedBackdropMotion = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.12 } },
	exit: { opacity: 0, transition: { duration: 0.08 } },
};

function Dialog(props: DialogPrimitive.Root.Props) {
	return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogPortal(props: DialogPrimitive.Portal.Props) {
	return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose(props: DialogPrimitive.Close.Props) {
	return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
	const reducedMotion = useReducedMotion();

	return (
		<DialogPrimitive.Backdrop
			data-slot="dialog-overlay"
			className={cn('fixed inset-0 z-50 bg-[rgba(24,38,24,0.55)] backdrop-blur-sm', className)}
			{...props}
			render={
				<m.div
					variants={reducedMotion ? reducedBackdropMotion : backdropMotion}
					initial="hidden"
					animate="visible"
					exit="exit"
				/>
			}
		/>
	);
}

function DialogContent({ className, children, ...props }: DialogPrimitive.Popup.Props) {
	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Popup
				data-slot="dialog-content"
				className={cn('fixed top-1/2 left-1/2 z-60 -translate-x-1/2 -translate-y-1/2 outline-none', className)}
				{...props}
			>
				{children}
			</DialogPrimitive.Popup>
		</DialogPortal>
	);
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
	return <DialogPrimitive.Title data-slot="dialog-title" className={cn(className)} {...props} />;
}

export { Dialog, DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogTitle };
