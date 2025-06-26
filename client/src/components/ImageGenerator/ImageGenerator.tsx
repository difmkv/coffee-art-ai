import { useState } from "react";
import { Image as ImageIcon, Sparkles, Download, Share2 } from "lucide-react";

import Spinner from "../Spinner/Spinner";
import ErrorDialog from "../ErrorDialog/ErrorDialog";
import ActionButton from "../ActionButton/ActionButton";
import {
  handleDownloadImage,
  handleShareToWhatsApp,
} from "../../utils/imageActions";

import styles from "./ImageGenerator.module.css";

export default function ImageGenerator() {
  const [userMessage, setUserMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  const startGeneration = async () => {
    setLoading(true);
    setError("");
    setImageUrl("");
    setUserMessage("");
    setIsErrorDialogOpen(false);

    try {
      const res = await fetch("/api/start");
      const data = await res.json();
      const jobId = data.jobId;

      setUserMessage(data.userMessage);

      const eventSource = new EventSource(`/api/stream/${jobId}`);

      eventSource.onmessage = (event) => {
        const { status, imageUrl: receivedImageUrl } = JSON.parse(event.data);

        if (status === "done") {
          setImageUrl(receivedImageUrl);
          setLoading(false);
          eventSource.close();
        }

        if (status === "error") {
          setError("Image generation failed");
          setLoading(false);
          setIsErrorDialogOpen(true);
          eventSource.close();
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE error:", err);
        setError("Connection lost. Please check your network.");
        setLoading(false);
        setIsErrorDialogOpen(true);
        eventSource.close();
      };
    } catch (err) {
      console.error(err);
      setError(
        "It's not you, it's me... or rather, it's your amazing enthusiasm for this API! You've hit the daily ceiling. See you tomorrow, you request rocket!"
      );
      setLoading(false);
      setIsErrorDialogOpen(true);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.heading}>
            <Sparkles className={styles.sparkleIcon} size={24} /> Rise and
            Shine!
          </h1>
          <p className={styles.paragraph}>
            Your Daily Dose of Bean-tiful Memes, Freshly Brewed.
          </p>

          <button
            onClick={startGeneration}
            disabled={loading}
            className={`${styles.button} ${
              loading ? styles.buttonDisabled : ""
            }`}
          >
            {loading ? (
              <>
                <Spinner />
                Generating...
              </>
            ) : (
              <>
                <ImageIcon className={styles.buttonIcon} size={20} /> Generate
                Image
              </>
            )}
          </button>

          {loading && (
            <div className={styles.loadingMessage}>
              <p className={styles.loadingMessageText}>{userMessage}</p>
            </div>
          )}

          {imageUrl && (
            <div className={styles.imageContainer}>
              <p className={styles.imageMessage}>{userMessage}</p>
              <div className={styles.imageWrapper}>
                <img src={imageUrl} alt="Generated" className={styles.image} />
                <div className={styles.actionButtons}>
                  <ActionButton
                    ariaLabel="Download Image"
                    onClick={() => handleDownloadImage(imageUrl)}
                    icon={<Download size={16} />}
                    type="download"
                  />
                  <ActionButton
                    ariaLabel="Share to WhatsApp"
                    onClick={() => handleShareToWhatsApp(imageUrl)}
                    icon={<Share2 size={16} />}
                    type="whatsapp"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ErrorDialog
        isOpen={isErrorDialogOpen}
        onClose={() => setIsErrorDialogOpen(false)}
        errorMessage={error}
      />
    </>
  );
}
