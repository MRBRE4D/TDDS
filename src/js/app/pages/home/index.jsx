import FileSvg from "@icons/file-pdf.svg?raw";

export default function HomePage() {
    return {
        view() {
            return (
                <div class="text-success">
                    <div>Hello World</div>
                    <div class="svg-icon" style="--svg-icon-width: 24px;">
                        {m.trust(FileSvg)}
                    </div>
                </div>
            );
        },
    };
}
