package presendguard.service;

import presendguard.dto.SignInRequest;
import presendguard.dto.SignUpRequest;
import presendguard.entity.User;
import presendguard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public void register(SignUpRequest request) {
        // 1. 이메일 중복 검사
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists.");
        }

        // 2. User 엔티티 생성 및 데이터 매핑
        User user = new User();
        user.setEmail(request.getEmail());
        // 비밀번호 암호화
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setUsername(request.getUsername());

        // 3. 데이터베이스 저장
        userRepository.save(user);
    }

    // 로그인 로직 추가
    @Transactional(readOnly = true)
    public boolean login(SignInRequest request) {
        // 1. 이메일로 사용자 조회
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        // 2. 사용자가 존재하고 비밀번호가 일치하는지 확인
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // passwordEncoder.matches(입력한 비밀번호, DB에 저장된 암호화 비밀번호)
            return passwordEncoder.matches(request.getPassword(), user.getPassword());
        }

        return false;
    }
}