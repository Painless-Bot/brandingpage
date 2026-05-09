package presendguard.repository;

import presendguard.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // 회원가입 시 중복 확인용
    boolean existsByEmail(String email);

    // 로그인 시 이메일로 사용자 정보를 가져오기 위해 반드시 필요함
    Optional<User> findByEmail(String email);
}