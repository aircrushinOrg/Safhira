export default function ChatLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html:
            '#dify-chatbot-bubble-button, #dify-chatbot-bubble-window { display: none !important; }'
        }}
      />
      {children}
    </>
  );
}


