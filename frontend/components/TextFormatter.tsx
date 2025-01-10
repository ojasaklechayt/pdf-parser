import { useState } from 'react'

export function TextFormatter({ onFormat }: { onFormat: (format: string) => void }) {
    const [isBold, setIsBold] = useState(false)
    const [isItalic, setIsItalic] = useState(false)
    const [isUnderline, setIsUnderline] = useState(false)

    const toggleBold = () => {
        setIsBold((prev) => !prev)
        onFormat('bold')
    }

    const toggleItalic = () => {
        setIsItalic((prev) => !prev)
        onFormat('italic')
    }

    const toggleUnderline = () => {
        setIsUnderline((prev) => !prev)
        onFormat('underline')
    }

    return (
        <div className="mb-4 flex space-x-4">
            <button
                onClick={toggleBold}
                className={`text-xl ${isBold ? 'text-blue-500' : 'text-gray-700'} hover:text-blue-500`}
            >
                <b>B</b>
            </button>
            <button
                onClick={toggleItalic}
                className={`text-xl ${isItalic ? 'text-blue-500' : 'text-gray-700'} hover:text-blue-500`}
            >
                <i>I</i>
            </button>
            <button
                onClick={toggleUnderline}
                className={`text-xl ${isUnderline ? 'text-blue-500' : 'text-gray-700'} hover:text-blue-500`}
            >
                <u>U</u>
            </button>
        </div>
    )
}
