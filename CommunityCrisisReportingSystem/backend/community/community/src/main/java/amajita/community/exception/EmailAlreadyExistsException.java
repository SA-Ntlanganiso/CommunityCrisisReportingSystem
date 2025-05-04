// src/main/java/amajita/community/exception/EmailAlreadyExistsException.java
package amajita.community.exception;

public class EmailAlreadyExistsException extends RuntimeException {
    public EmailAlreadyExistsException(String message) {
        super(message);
    }
}