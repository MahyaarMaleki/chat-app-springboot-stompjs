package com.example.chat.model;

import com.example.chat.model.enumeration.MessageType;
import lombok.*;

/**
 * @author Mahyar Maleki
 */

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ChatMessage {
    private String content;

    private String sender;

    private MessageType messageType;
}
