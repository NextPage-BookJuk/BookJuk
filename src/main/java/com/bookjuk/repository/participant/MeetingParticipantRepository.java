package com.bookjuk.repository.participant;

import com.bookjuk.domain.participant.MeetingParticipant;
import com.bookjuk.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MeetingParticipantRepository extends JpaRepository<MeetingParticipant, Long>, MeetingParticipantCustomRepository {

}
