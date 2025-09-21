/**
 * Chat section layout component that hides the global chatbot widget to prevent duplication on chat pages.
 * This layout ensures a clean chat interface by hiding the floating chatbot button when users are already in the chat section.
 * Provides style injection to override global chatbot visibility for optimal user experience within the dedicated chat interface.
 */
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


