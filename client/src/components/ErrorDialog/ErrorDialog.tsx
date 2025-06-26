import React, { Fragment } from "react";
import {
  Dialog,
  Transition,
  DialogTitle,
  TransitionChild,
  DialogPanel,
} from "@headlessui/react";
import { AlertCircle, XCircle } from "lucide-react";
import styles from "./ErrorDialog.module.css";

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({
  isOpen,
  onClose,
  errorMessage,
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className={styles.dialogRoot} onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter={styles.transitionEnter}
          enterFrom={styles.transitionEnterFrom}
          enterTo={styles.transitionEnterTo}
          leave={styles.transitionLeave}
          leaveFrom={styles.transitionLeaveFrom}
          leaveTo={styles.transitionLeaveTo}
        >
          <div className={styles.overlay} />
        </TransitionChild>

        <div className={styles.dialogContainer}>
          <div className={styles.dialogWrapper}>
            <TransitionChild
              as={Fragment}
              enter={styles.transitionEnter}
              enterFrom={styles.panelEnterFrom}
              enterTo={styles.panelEnterTo}
              leave={styles.transitionLeave}
              leaveFrom={styles.panelLeaveFrom}
              leaveTo={styles.panelLeaveTo}
            >
              <DialogPanel className={styles.panel}>
                <button
                  type="button"
                  onClick={onClose}
                  className={styles.closeButton}
                  tabIndex={0}
                  aria-label="Close dialog"
                >
                  <XCircle size={20} />
                </button>

                <DialogTitle as="h3" className={styles.title}>
                  <AlertCircle className={styles.titleIcon} size={24} />{" "}
                  Generation Error
                </DialogTitle>
                <div className={styles.descriptionContainer}>
                  <p className={styles.descriptionText}>{errorMessage}</p>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ErrorDialog;
