package com.banking.accountservice.util;


import org.springframework.stereotype.Component;

import java.util.Random;

@Component
public class AccountNumberGenerator {

    private static final String PREFIX = "ACC";
    private static final Random RANDOM = new Random();

    public String generateAccountNumber() {
        long timestamp = System.currentTimeMillis() % 1000000;
        int randomPart = RANDOM.nextInt(90000) + 10000;
        return PREFIX + timestamp + randomPart;
    }
}