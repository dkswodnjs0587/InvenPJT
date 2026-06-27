package com.invenpjt.backend.notification;

import com.invenpjt.backend.member.Member;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findTop30ByRecipientOrderByCreatedAtDesc(Member recipient);

    long countByRecipientAndIsReadFalse(Member recipient);

    @Modifying
    @Query("update Notification n set n.isRead = true where n.recipient = :member and n.isRead = false")
    void markAllReadByRecipient(@Param("member") Member member);
}
