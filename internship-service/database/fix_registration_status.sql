BEGIN;

ALTER TABLE internship_registrations
DROP CONSTRAINT IF EXISTS internship_registrations_status_check;

ALTER TABLE internship_registrations
ADD CONSTRAINT internship_registrations_status_check
CHECK (
    status IN (
        'PENDING_COMPANY',
        'REJECTED_COMPANY',
        'PENDING_LECTURER',
        'REJECTED_LECTURER',
        'IN_PROGRESS',
        'COMPLETED_COMPANY',
        'COMPLETED'
    )
);

COMMIT;
