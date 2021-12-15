import React, {useCallback, useContext, useEffect, useMemo} from 'react';
import {Internals, TComposition} from 'remotion';
import {TCompositionGroup} from 'remotion/src/CompositionManager';
import {loadMarks} from '../state/marks';
import {useZIndex} from '../state/z-index';
import {CompositionSelectorGroup} from './CompositionSelectorGroup';
import {CompositionSelectorItem} from './CompositionSelectorItem';
import {CurrentComposition} from './CurrentComposition';
import {
	getCurrentCompositionFromUrl,
	getFrameForComposition,
} from './FramePersistor';
import {inOutHandles} from './TimelineInOutToggle';

const container: React.CSSProperties = {
	borderRight: '1px solid black',
	position: 'absolute',
	height: '100%',
	width: '100%',
	flex: 1,
};

const list: React.CSSProperties = {
	padding: 5,
	height: 'calc(100% - 100px)',
	overflowY: 'auto',
};

export const CompositionSelector: React.FC = () => {
	const {compositions, setCurrentComposition, currentComposition} = useContext(
		Internals.CompositionManager
	);

	const groupedCompositions = useMemo(
		() =>
			compositions.reduce<
				Array<(TCompositionGroup & {open?: boolean}) | TComposition>
			>((result, current) => {
				if (current.id.indexOf('-') === -1) {
					result.push(current);
					return result;
				}

				const compositionId = current.id.split('-').slice();
				const groupId = compositionId[0];
				const groupIndex = result.findIndex(
					(item) => 'groupId' in item && item.groupId === groupId
				);

				if (groupIndex === -1) {
					result.push({
						groupId,
						compositions: [current],
						open: currentComposition === current.id,
					});
				} else {
					(result[groupIndex] as TCompositionGroup).compositions.push(current);

					if (currentComposition === current.id) {
						// @ts-expect-error
						result[groupIndex].open = true;
					}
				}

				return result;
			}, []),
		[compositions, currentComposition]
	);

	const {tabIndex} = useZIndex();
	const setCurrentFrame = Internals.Timeline.useTimelineSetFrame();

	const selectComposition = useCallback(
		(c: TComposition) => {
			inOutHandles.current?.setMarks(loadMarks(c.id, c.durationInFrames));
			window.history.pushState({}, 'Preview', `/${c.id}`);
			const frame = getFrameForComposition(c.id);
			const frameInBounds = Math.min(c.durationInFrames - 1, frame);
			setCurrentFrame(frameInBounds);
			setCurrentComposition(c.id);
		},
		[setCurrentComposition, setCurrentFrame]
	);

	useEffect(() => {
		if (currentComposition) {
			return;
		}

		const compositionFromUrl = getCurrentCompositionFromUrl();
		if (compositionFromUrl) {
			const exists = compositions.find((c) => c.id === compositionFromUrl);
			if (exists) {
				selectComposition(exists);
				return;
			}
		}

		if (compositions.length > 0) {
			selectComposition(compositions[0]);
		}
	}, [compositions, currentComposition, selectComposition]);

	return (
		<div style={container}>
			<CurrentComposition />
			<div style={list}>
				{groupedCompositions.map((c) =>
					'id' in c ? (
						<CompositionSelectorItem
							key={c.id}
							currentComposition={currentComposition}
							selectComposition={selectComposition}
							tabIndex={tabIndex}
							composition={c}
						/>
					) : (
						<CompositionSelectorGroup key={c.groupId} name={c.groupId}>
							{c.compositions.map((ic) => (
								<CompositionSelectorItem
									key={ic.id}
									currentComposition={currentComposition}
									selectComposition={selectComposition}
									tabIndex={tabIndex}
									composition={ic}
								/>
							))}
						</CompositionSelectorGroup>
					)
				)}
			</div>
		</div>
	);
};
