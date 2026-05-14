package presendguard.repository;

import presendguard.domain.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    List<Inquiry> findAllByUserIdOrderByCreatedAtDesc(Long userId);
}