import Papa from "papaparse";
import { csvLeadRowSchema, RowValidationResult } from "./schema";

export function parseCSV(file: File) {
    return new Promise<Record<string, string>[]>((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: false,
            complete: (results) => {
                if (results.errors.length > 0) {
                    console.warn("CSV parsing warnings:", results.errors);
                }
                resolve(results.data as Record<string, string>[]);
            },
            error: (error) => {
                console.error("CSV parsing error:", error);
                reject(new Error("Failed to parse CSV file"));
            },
        });
    });
}

export function unparseCSV(
    data: Record<string, unknown>[],
    columns?: string[],
): string {
    try {
        const result = Papa.unparse(data, {
            columns,
            header: true,
        });
        return result;
    } catch (error) {
        console.error("CSV unparsing error:", error);
        throw new Error("Failed to convert data to CSV");
    }
}

export function validateRows(
    rows: Record<string, string>[],
): RowValidationResult[] {
    return rows.map((row, index) => {
        const result = csvLeadRowSchema.safeParse(row);

        if (result.success) {
            return {
                rowNumber: index + 2,
                valid: true,
                data: result.data,
                errors: null,
            };
        }

        return {
            rowNumber: index + 2,
            valid: false,
            data: null,
            errors: result.error.flatten().fieldErrors as Record<string, string[]>,
        };
    });
}

export function generateTemplateCSV(): string {
    const examples = [
        {
            phone: "+15551234567",
            name: "Jane Smith",
            email: "jane@example.com",
            assigneeEmail: "agent@company.com",
        },
        {
            phone: "+15559876543",
            name: "Bob Johnson",
            email: "",
            assigneeEmail: "",
        },
    ];

    return unparseCSV(examples, ["phone", "name", "email", "assigneeEmail"]);
}