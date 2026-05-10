package presendguard.service;

import presendguard.dto.SignInRequest;
import presendguard.dto.SignUpRequest;
import presendguard.dto.UserInfoResponse;
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
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists.");
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setUsername(request.getUsername());
        userRepository.save(user);
    }

    // ✅ 로그인 성공 시 UserInfoResponse 반환
    @Transactional(readOnly = true)
    public UserInfoResponse login(SignInRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return new UserInfoResponse(user.getUsername(), user.getEmail(), user.getCreatedAt());
            }
        }
        return null;
    }
}