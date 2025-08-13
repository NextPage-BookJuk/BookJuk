package com.bookjuk.controller;

import com.bookjuk.service.MeetingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;
}
