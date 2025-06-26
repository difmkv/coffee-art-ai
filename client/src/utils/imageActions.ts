export const handleShareToWhatsApp = (imageUrl: string) => {
  if (imageUrl) {
    const message = encodeURIComponent(
      "Check out this awesome coffee meme I generated!"
    );
    const whatsappUrl = `https://api.whatsapp.com/send?text=${message}%0A${encodeURIComponent(
      imageUrl
    )}`;
    window.open(whatsappUrl, "_blank");
  }
};

export const handleDownloadImage = (imageUrl: string) => {
  if (imageUrl) {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "coffee_meme.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
