package com.bookjuk.dto.board;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantDecisionRequest {

    public enum Action { APPROVE, REJECT }

    @NotNull
    private Action action;
}