const ContactSection = () => {
    return (
        <div className="flex flex-wrap gap-4 p-4 mx-4">
            <div className="sticky-note bg-cyan-200">
                <address>
                    Creator of this mess<br />
                    Oliver Andersson <br /> <br /> <br />
                    Contact if something breaks at <br />
                    <a href="mailto:oliversofta@gmail.com">oliversofta@gmail.com</a>
                </address>
            </div>
            <div className="sticky-note bg-lime-300 text-2xl">
                <a href="">Found the Project ! </a>
            </div>
            <div className="sticky-note bg-purple-300">
                
            </div>
        </div>
    )
}

export default ContactSection