import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { SessionView } from "../components/session-view";
import type { ChatMessage } from "../components/message";
import { appendMessage, getSession } from "../lib/sessions";

export function Session() {
  const { id } = useParams();
  const navigate = useNavigate();

  const session = id 

  useEffect(() => {
    //setMessages(session?.messages ?? []);
  }, [id, session]);

  useEffect(() => {
    if (!session) {
      navigate("/", { replace: true });
    }
  }, [session, navigate]);

  if (!session) {
    return null;
  }

  return (
    <SessionView
      title = {String(id)}
      messages={[]}
      onSubmit={()=>{}}
      emptyText="This session has no messages yet."
      inputDisabled
      loading = {false}
    />
  );
}
