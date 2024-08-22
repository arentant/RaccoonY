import { ButtonHTMLAttributes, FC, SVGProps } from "react";

type ButtonProps = {
    Icon?: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button: FC<ButtonProps> = ({ Icon, children, ...props }) => {
    return (
        <button {...props} className={"px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white flex items-center gap-1 rounded-lg " + props.className} >
            {
                Icon &&
                <Icon className="h-5 w-5" />
            }
            {children}
        </button>
    );
}

export default Button;