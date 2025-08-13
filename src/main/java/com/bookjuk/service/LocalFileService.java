package com.bookjuk.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
public class LocalFileService implements FileService{

    // application.yml에 설정한 'file.upload.location' 값을 자동으로 주입받습니다.
    @Value("${file.upload.location}")
    private String uploadPath;

    @Override
    public String uploadFile(MultipartFile file) throws IOException {
        // 1. 파일이 전송되지 않았거나 비어있는 경우 null을 반환합니다.
        if (file == null || file.isEmpty()) {
            return null;
        }

        // 2. 업로드 경로에 해당하는 디렉터리가 존재하지 않으면 생성합니다.
        File uploadDir = new File(uploadPath);
        if (!uploadDir.exists()) {
            boolean created = uploadDir.mkdirs();
            log.info("업로드 디렉터리 생성: {}, 성공 여부: {}", uploadPath, created);
        }

        // 3. 파일명 중복을 방지하기 위해 고유한 파일명을 생성합니다. (UUID 사용)
        String originalFilename = file.getOriginalFilename();
        String storedFileName = createStoredFileName(originalFilename);

        // 4. 최종 저장 경로와 파일명을 합쳐 파일을 서버에 저장합니다.
        File destination = new File(uploadPath, storedFileName);
        file.transferTo(destination);
        log.info("파일 저장 성공: {}", destination.getAbsolutePath());

        // 5. 웹에서 이 파일에 접근할 때 사용할 URL 경로를 반환합니다.
        //    (WebConfig 설정이 이 경로를 실제 파일 위치와 매핑해줍니다.)
        return "/uploads/" + storedFileName;
    }

    // 원본 파일명에서 확장자를 추출합니다.
    private String extractExtension(String originalFilename) {
        try {
            int pos = originalFilename.lastIndexOf(".");
            return originalFilename.substring(pos + 1);
        } catch (StringIndexOutOfBoundsException e) {
            // 확장자가 없는 파일의 경우 처리
            return "";
        }
    }

    // 서버에 저장될 고유한 파일명을 생성합니다. (예: a4e6-8b1e-11e9.png)
    private String createStoredFileName(String originalFilename) {
        String uuid = UUID.randomUUID().toString();
        String extension = extractExtension(originalFilename);
        return uuid + "." + extension;
    }

}
