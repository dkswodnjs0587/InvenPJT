package com.invenpjt.backend.common;

import com.invenpjt.backend.member.AuthController;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private final Path uploadDir = Paths.get("uploads").toAbsolutePath();

    public UploadController() {
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new IllegalStateException("업로드 디렉터리를 생성하지 못했습니다.", e);
        }
    }

    @PostMapping("/image")
    public Map<String, String> uploadImage(@RequestParam("file") MultipartFile file, HttpSession session) {
        Object memberId = session.getAttribute(AuthController.MEMBER_ID);
        if (!(memberId instanceof Long)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "파일이 비어 있습니다.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 파일만 업로드할 수 있습니다.");
        }

        String filename = UUID.randomUUID().toString().replace("-", "") + resolveExtension(contentType, file.getOriginalFilename());
        try {
            Path target = uploadDir.resolve(filename).normalize();
            if (!target.startsWith(uploadDir)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 파일 이름입니다.");
            }
            file.transferTo(target);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 저장에 실패했습니다.");
        }

        return Map.of("url", "/api/uploads/" + filename);
    }

    private String resolveExtension(String contentType, String originalFilename) {
        switch (contentType) {
            case "image/png":
                return ".png";
            case "image/jpeg":
                return ".jpg";
            case "image/gif":
                return ".gif";
            case "image/webp":
                return ".webp";
            case "image/bmp":
                return ".bmp";
            default:
                if (originalFilename != null && originalFilename.contains(".")) {
                    String ext = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase();
                    if (ext.matches("\\.[a-z0-9]{1,5}")) {
                        return ext;
                    }
                }
                return ".img";
        }
    }
}
