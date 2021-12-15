import React, {useCallback, useMemo, useState} from 'react';

const container: React.CSSProperties = {
	backgroundColor: 'rgba(0, 0, 0, 0.125)',
};

const header: React.CSSProperties = {
	display: 'flex',
	paddingLeft: 8,
	paddingRight: 8,
	paddingTop: 6,
	paddingBottom: 6,
	cursor: 'pointer',
	justifyContent: 'space-between',
};

export const CompositionSelectorGroup: React.FC<{
	name: string;
	open?: boolean
	children: React.ReactNode;
}> = ({name, open = false, children}) => {
	const [isOpen, setIsOpen] = useState(open);

	const contentContainerStyle = useMemo(
		() => ({
			display: isOpen ? 'block' : 'none',
		}),
		[isOpen]
	);

  const onHeaderClick = useCallback(() => {
    setIsOpen(state => !state)
  }, [])

	return (
		<div style={container}>
			<div style={header} onClick={onHeaderClick}>
				{name}
				<span>{isOpen ? '-' : '+'}</span>
			</div>
			<div style={contentContainerStyle}>{children}</div>
		</div>
	);
};
