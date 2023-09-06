package com.example.chat.websocket;

import com.example.chat.model.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import static com.example.chat.model.enumeration.MessageType.*;

/**
 * @author Mahyar Maleki
 */

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {
    private final SimpMessageSendingOperations messageSendingOperations;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        if(username != null) {
            log.info("User disconnected: {}", username);
            ChatMessage chatMessage = new ChatMessage();
            chatMessage.setSender(username);
            chatMessage.setMessageType(LEAVE);

            messageSendingOperations.convertAndSend("/topic/public", chatMessage);
        }
    }
}
