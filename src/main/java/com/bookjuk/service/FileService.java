package com.bookjuk.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

/**
 * application.yml의 file.upload.location 값을 읽어와서 실제 파일을 저장하는 역할
 * MultipartFile을 서버의 지정된 위치에 업로드합니다.
 *
 * @return 웹에서 접근 가능한 파일의 URL, 파일이 없으면 null
 * @throws IOException 파일 저장 중 오류 발생 시
 */
public interface FileService {

    String uploadFile(MultipartFile file) throws IOException;

}
